import React from 'react';

export function Field({ label, value, onChange, type = 'text', min, max }) {
  return React.createElement('label', { className: 'mt-4 block' },
    React.createElement('span', { className: 'text-sm font-bold text-slateblue' }, label),
    React.createElement('input', {
      type,
      value,
      min,
      max,
      onChange: e => onChange(e.target.value),
      className: 'mt-2 w-full rounded-lg border border-creamline bg-white px-4 py-3 text-ink outline-none ring-cyanbrand/20 focus:ring-4'
    })
  );
}

export function SelectField({ label, value, onChange, options }) {
  return React.createElement('label', { className: 'mt-4 block' },
    React.createElement('span', { className: 'text-sm font-bold text-slateblue' }, label),
    React.createElement('select', {
      value,
      onChange: e => onChange(e.target.value),
      className: 'mt-2 w-full rounded-lg border border-creamline bg-white px-4 py-3 text-ink outline-none ring-cyanbrand/20 focus:ring-4'
    },
      options.map(option => React.createElement('option', { key: option, value: option }, option))
    )
  );
}

export function MetricCard({ label, value, tone }) {
  return React.createElement('div', { className: 'rounded-lg bg-white/85 p-5 shadow-academic' },
    React.createElement('p', { className: 'text-sm font-bold text-slateblue' }, label),
    React.createElement('p', { className: `mt-3 text-3xl font-black ${tone === 'cyan' ? 'text-cyanbrand' : 'text-ink'}` }, value)
  );
}
