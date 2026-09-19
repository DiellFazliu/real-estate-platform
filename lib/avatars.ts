/**
 * Avatar Generator - Business Portraits
 * Foto reale profesionale nga Unsplash
 */

function hashString(str: string): number {
  return str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
}

// ═══════════════════════════════════════════════════════════════
// MALE BUSINESS PORTRAITS
// ═══════════════════════════════════════════════════════════════

const MALE_PORTRAITS = [
  // Business men in suits
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1590086782957-93c06ef21604?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1615109398623-88346a601842?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1601455763557-db1bea8a9a5a?w=400&h=400&fit=crop&crop=face',
]

// ═══════════════════════════════════════════════════════════════
// FEMALE BUSINESS PORTRAITS
// ═══════════════════════════════════════════════════════════════

const FEMALE_PORTRAITS = [
  // Business women in suits
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1614289371518-722f2615943d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1592621385612-4d7129426394?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1601412436009-d964bd02edbc?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=400&h=400&fit=crop&crop=face',
]

// ═══════════════════════════════════════════════════════════════
// FUNKSIONI KRYESOR
// ═══════════════════════════════════════════════════════════════

export function getBusinessPortrait(
  name: string,
  gender: 'male' | 'female'
): string {
  const hash = hashString(name)
  const portraits = gender === 'male' ? MALE_PORTRAITS : FEMALE_PORTRAITS
  return portraits[hash % portraits.length]
}

// Export për përdorim
export { getBusinessPortrait as getAvatar }