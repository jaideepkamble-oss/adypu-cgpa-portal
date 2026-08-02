const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;
const FIREBASE_PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map(email => email.trim().toLowerCase())
  .filter(Boolean);

const AUTH_BASE = 'https://identitytoolkit.googleapis.com/v1';
const FIRESTORE_BASE = FIREBASE_PROJECT_ID
  ? `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`
  : '';

function requireFirebaseConfig() {
  if (!FIREBASE_API_KEY || !FIREBASE_PROJECT_ID) {
    throw new Error('Firebase environment variables are missing. Add VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID.');
  }
}

function roleForEmail(email) {
  return ADMIN_EMAILS.includes(String(email || '').toLowerCase()) ? 'admin' : 'student';
}

async function authRequest(endpoint, body) {
  requireFirebaseConfig();
  const response = await fetch(`${AUTH_BASE}/${endpoint}?key=${FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Firebase Authentication request failed.');
  }
  return data;
}

export function getStoredAuthUser() {
  try {
    return JSON.parse(localStorage.getItem('firebase:authUser'));
  } catch {
    return null;
  }
}

export function storeAuthUser(user) {
  localStorage.setItem('firebase:authUser', JSON.stringify(user));
}

export function clearStoredAuthUser() {
  localStorage.removeItem('firebase:authUser');
}

function authUserFromResponse(data, fallback = {}) {
  const email = data.email || fallback.email || '';
  return {
    uid: data.localId || data.uid,
    email,
    name: fallback.name || data.displayName || email.split('@')[0] || 'ADYPU Student',
    role: fallback.role || roleForEmail(email),
    idToken: data.idToken,
    refreshToken: data.refreshToken,
    emailVerified: Boolean(data.emailVerified),
    provider: fallback.provider || 'Email'
  };
}

export async function registerWithEmail({ name, email, password }) {
  const data = await authRequest('accounts:signUp', {
    email,
    password,
    returnSecureToken: true
  });
  const user = authUserFromResponse(data, { name, email, provider: 'Email' });
  await authRequest('accounts:update', {
    idToken: user.idToken,
    displayName: name,
    returnSecureToken: false
  });
  await sendVerificationEmail(user.idToken);
  await saveUserRecord(user, { name, email, role: user.role, emailVerified: false });
  storeAuthUser(user);
  return user;
}

export async function loginWithEmail({ email, password }) {
  const data = await authRequest('accounts:signInWithPassword', {
    email,
    password,
    returnSecureToken: true
  });
  const user = authUserFromResponse(data, { email, provider: 'Email' });
  const record = await getUserRecord(user);
  const merged = { ...user, ...(record?.profile || {}), role: record?.role || user.role };
  storeAuthUser(merged);
  return merged;
}

export async function sendPasswordReset(email) {
  await authRequest('accounts:sendOobCode', {
    requestType: 'PASSWORD_RESET',
    email
  });
}

export async function sendVerificationEmail(idToken) {
  await authRequest('accounts:sendOobCode', {
    requestType: 'VERIFY_EMAIL',
    idToken
  });
}

function loadGoogleIdentityScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existing = document.querySelector('script[data-google-identity]');
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = 'true';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export async function loginWithGoogle() {
  requireFirebaseConfig();
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Google Client ID is missing. Add VITE_GOOGLE_CLIENT_ID to enable Google login.');
  }
  await loadGoogleIdentityScript();
  const credential = await new Promise((resolve, reject) => {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: response => response?.credential ? resolve(response.credential) : reject(new Error('Google login was cancelled.'))
    });
    window.google.accounts.id.prompt(notification => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        reject(new Error('Google prompt could not be displayed. Check VITE_GOOGLE_CLIENT_ID and authorized origins.'));
      }
    });
  });
  const data = await authRequest('accounts:signInWithIdp', {
    postBody: `id_token=${credential}&providerId=google.com`,
    requestUri: window.location.origin,
    returnIdpCredential: true,
    returnSecureToken: true
  });
  const user = authUserFromResponse(data, { provider: 'Google' });
  await saveUserRecord(user, { name: user.name, email: user.email, role: user.role, emailVerified: user.emailVerified });
  storeAuthUser(user);
  return user;
}

function toFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toFirestoreValue) } };
  }
  if (typeof value === 'object') {
    return {
      mapValue: {
        fields: Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, toFirestoreValue(nested)]))
      }
    };
  }
  return { stringValue: String(value) };
}

function fromFirestoreValue(value) {
  if (!value) return undefined;
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('nullValue' in value) return null;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(fromFirestoreValue);
  if ('mapValue' in value) {
    return Object.fromEntries(Object.entries(value.mapValue.fields || {}).map(([key, nested]) => [key, fromFirestoreValue(nested)]));
  }
  return undefined;
}

function fromFirestoreDocument(document) {
  if (!document?.fields) return null;
  return Object.fromEntries(Object.entries(document.fields).map(([key, value]) => [key, fromFirestoreValue(value)]));
}

async function firestoreRequest(path, { method = 'GET', idToken, body } = {}) {
  requireFirebaseConfig();
  const response = await fetch(`${FIRESTORE_BASE}/${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Firestore request failed.');
  }
  return data;
}

export async function setDocument(collection, id, data, user) {
  if (!user?.idToken) return null;
  const document = {
    fields: Object.fromEntries(Object.entries({
      ...data,
      updatedAt: new Date().toISOString()
    }).map(([key, value]) => [key, toFirestoreValue(value)]))
  };
  return firestoreRequest(`${collection}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    idToken: user.idToken,
    body: document
  });
}

export async function getDocument(collection, id, user) {
  if (!user?.idToken) return null;
  try {
    const document = await firestoreRequest(`${collection}/${encodeURIComponent(id)}`, { idToken: user.idToken });
    return fromFirestoreDocument(document);
  } catch (error) {
    if (String(error.message).includes('NOT_FOUND')) return null;
    throw error;
  }
}

export async function listDocuments(collection, user) {
  if (!user?.idToken) return [];
  try {
    const data = await firestoreRequest(collection, { idToken: user.idToken });
    return (data.documents || []).map(document => ({
      id: decodeURIComponent(document.name.split('/').pop()),
      ...fromFirestoreDocument(document)
    }));
  } catch {
    return [];
  }
}

export async function saveUserRecord(user, data = {}) {
  return setDocument('users', user.uid, {
    uid: user.uid,
    email: user.email,
    name: user.name,
    role: user.role || roleForEmail(user.email),
    profile: data.profile || data,
    lastLoginAt: new Date().toISOString()
  }, user);
}

export async function getUserRecord(user) {
  return getDocument('users', user.uid, user);
}

export async function saveAcademicData(user, data) {
  return setDocument('reports', user.uid, {
    uid: user.uid,
    email: user.email,
    ...data
  }, user);
}

export async function saveVerificationRequest(user, request) {
  return setDocument('verificationRequests', request.id, {
    ...request,
    uid: user.uid,
    storageDisabled: true
  }, user);
}

export async function savePaperRequest(user, request) {
  return setDocument('papers', request.id, {
    ...request,
    uid: user.uid,
    storageDisabled: true
  }, user);
}

export async function saveLeaderboardStudent(user, student) {
  return setDocument('leaderboard', student.id, student, user);
}

export async function saveNotification(user, notification) {
  return setDocument('notifications', notification.id, notification, user);
}
