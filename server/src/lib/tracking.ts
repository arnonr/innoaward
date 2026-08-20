export function generateTrackingCode(year: number = 2569): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `KMUTNB-${year}-${randomNum}`;
}
