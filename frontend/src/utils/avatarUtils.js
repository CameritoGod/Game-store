export const generateSVGPlaceholder = (nameStr = 'U') => {
  const initials = nameStr
    .trim()
    .split(' ')
    .map(part => part[0])
    .filter(Boolean)
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140">
    <defs>
      <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3d0066" />
        <stop offset="100%" stop-color="#7a2cff" />
      </linearGradient>
    </defs>
    <rect width="140" height="140" rx="70" fill="url(#avatarGrad)" />
    <text x="50%" y="54%" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="bold" fill="#ffffff" dominant-baseline="middle" text-anchor="middle" letter-spacing="1">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const getAvatarUrl = (user) => {
  if (!user) return generateSVGPlaceholder('U');

  const avatarPath = user.avatar || user.avatar_url;
  if (avatarPath && typeof avatarPath === 'string' && avatarPath.trim() !== '' && avatarPath !== 'null' && avatarPath !== 'undefined') {
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://') || avatarPath.startsWith('data:image')) {
      return avatarPath;
    }
    return avatarPath;
  }

  const seed = user.nickname || user.nombre || user.name || 'U';
  return `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(seed)}`;
};
