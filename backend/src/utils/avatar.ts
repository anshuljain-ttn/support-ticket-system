export function buildAvatarUrl(name: string): string {
  const seed = encodeURIComponent(name.trim() || 'user');
  return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}`;
}
