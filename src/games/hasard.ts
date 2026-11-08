export const entierAleatoire = (max: number) => Math.floor(Math.random() * max);

export function melanger<T>(liste: T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = entierAleatoire(i + 1);
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}
