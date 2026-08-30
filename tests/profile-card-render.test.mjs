import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderProfileCard } from '../src/components/profile-card.js';

const profile = {
  identity: {
    displayName: 'Antonio Abrenica',
    formalName: 'Antonio A. Abrenica III',
  },
  role: 'Full-Stack Software Developer',
  portrait: {
    src: '/images/profile/aaa-portrait.jpg',
    alt: 'Portrait of Antonio A. Abrenica III',
    width: 1665,
    height: 1464,
  },
};

test('full variant renders statement and three highlights but no action or lazy-loading attribute', () => {
  const html = renderProfileCard({
    variant: 'full',
    profile,
    statement: 'Approved statement.',
    highlights: ['One', 'Two', 'Three'],
    action: { label: 'Ignored', path: '/contact/' },
  });
  assert.match(html, /profile-card--full/);
  assert.match(
    html,
    /<p class="profile-card__name">Antonio A\. Abrenica III<\/p>/,
  );
  assert.match(html, /Approved statement\./);
  assert.equal([...html.matchAll(/<li>/g)].length, 3);
  assert.doesNotMatch(html, /profile-card__action|href=|loading=/);
});

test('compact variant renders exactly one action and lazy-loads the portrait without statement or highlights', () => {
  const html = renderProfileCard({
    variant: 'compact',
    profile,
    statement: 'Ignored statement.',
    highlights: ['Ignored'],
    action: { label: 'Read My Full Story', path: '/about/' },
  });
  assert.match(html, /profile-card--compact/);
  assert.match(html, /<p class="profile-card__name">Antonio Abrenica<\/p>/);
  assert.match(
    html,
    /<a class="btn btn--primary profile-card__action" href="\/about\/">Read My Full Story<\/a>/,
  );
  assert.equal([...html.matchAll(/href="\/about\/"/g)].length, 1);
  assert.match(html, /<img[^>]+loading="lazy">/);
  assert.doesNotMatch(html, /profile-card__statement|profile-card__highlights/);
});

test('renderer escapes all visitor-facing profile and variant strings', () => {
  const html = renderProfileCard({
    variant: 'compact',
    profile: {
      identity: {
        displayName: '<b>Name</b>',
        formalName: '<i>Formal</i>',
      },
      role: 'Role & more',
      portrait: {
        src: '/images/"><script>.jpg',
        alt: 'Alt & text',
        width: 10,
        height: 20,
      },
    },
    action: { label: 'Read & go', path: '/about/' },
  });
  assert.doesNotMatch(html, /<script>|<b>/);
  assert.match(html, /&lt;b&gt;Name&lt;\/b&gt;/);
  assert.match(html, /Role &amp; more/);
  assert.match(html, /Alt &amp; text/);
  assert.match(html, /Read &amp; go/);
});

test('full variant escapes the formal identity independently of the concise name', () => {
  const html = renderProfileCard({
    variant: 'full',
    profile: {
      ...profile,
      identity: {
        displayName: '<b>Concise</b>',
        formalName: '<script>Formal</script>',
      },
    },
    statement: 'Statement',
    highlights: [],
  });
  assert.doesNotMatch(html, /<script>|<b>/);
  assert.match(html, /&lt;script&gt;Formal&lt;\/script&gt;/);
  assert.doesNotMatch(html, /Concise/);
});

test('renderer rejects an unknown variant', () => {
  assert.throws(
    () => renderProfileCard({ variant: 'other', profile }),
    /variant must be one of full, compact/,
  );
});
