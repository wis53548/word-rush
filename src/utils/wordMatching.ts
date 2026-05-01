export const normalizeSpokenText = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]|_/g, '')
    .replace(/\s+/g, ' ');

const editDistance = (left: string, right: string): number => {
  const costs = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let i = 1; i <= left.length; i += 1) {
    let previous = i;
    for (let j = 1; j <= right.length; j += 1) {
      const current = costs[j];
      costs[j] =
        left[i - 1] === right[j - 1]
          ? costs[j - 1]
          : Math.min(costs[j - 1], previous, costs[j]) + 1;
      previous = current;
    }
    costs[0] = i;
  }

  return costs[right.length];
};

export const isCloseWordMatch = (spoken: string, target: string): boolean => {
  const normalizedSpoken = normalizeSpokenText(spoken);
  const normalizedTarget = normalizeSpokenText(target);
  const words = normalizedSpoken.split(' ');

  if (normalizedSpoken === normalizedTarget || words.includes(normalizedTarget)) {
    return true;
  }

  if (normalizedTarget.length <= 3) {
    return editDistance(normalizedSpoken, normalizedTarget) <= 1;
  }

  return editDistance(normalizedSpoken, normalizedTarget) <= 2;
};
