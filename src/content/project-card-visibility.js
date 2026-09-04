// Publication state belongs to each canonical project card, while both page
// templates share this strict selection boundary. Hidden projects stay in the
// raw content arrays for schema, route-completeness, and asset validation.
export function getVisibleProjectCards(items) {
  if (!Array.isArray(items)) {
    throw new TypeError('getVisibleProjectCards: items must be an array');
  }

  for (const [index, item] of items.entries()) {
    if (typeof item?.isVisible !== 'boolean') {
      throw new TypeError(
        `getVisibleProjectCards: items[${index}].isVisible must be a boolean`,
      );
    }
  }

  const visibleItems = items.filter((item) => item.isVisible);
  if (visibleItems.length === 0) {
    throw new Error(
      'getVisibleProjectCards: at least one project must be visible',
    );
  }
  return visibleItems;
}
