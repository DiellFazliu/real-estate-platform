// ═══════════════════════════════════════════════════════════════
// URL-të E IMAZHEVE NGA UNSPLASH
// Të ndara sipas tipit të pronës
// ═══════════════════════════════════════════════════════════════

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1200&q=80`

const unsplashAvatar = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=400&h=400&fit=crop&crop=faces`

// ═══════════════════════════════════════════════════════════════
// IMAGES PËR PRONA
// ═══════════════════════════════════════════════════════════════

export const APARTMENT_IMAGES = [
  '1522708323590-d24dbb6b0261',
  '1560448204-e02f11c3d0e2',
  '1502672260266-1c1ef2d93688',
  '1493809842364-78817add7ffb',
  '1560185007-c5ca9d2c014d',
  '1567496898669-ee935f5f647a',
  '1512918728675-ed5a9ecdebfd',
  '1554995207-c18c203602cb',
  '1571508601891-ca5e7a713859',
  '1600607687939-ce8a6c25118c',
  '1600585154340-be6161a56a0c',
  '1512917774080-9991f1c4c750',
  '1567767292278-a4f21aa2d36e',
  '1502005229762-cf1b2da7c5d6',
  '1540518614846-7eded433c457',
].map(unsplash)

export const HOUSE_IMAGES = [
  '1568605114967-8130f3a36994',
  '1580587771525-78b9dba3b914',
  '1570129477492-45c003edd2be',
  '1583608205776-bfd35f0d9f83',
  '1605276374104-dee2a0ed3cd6',
  '1513584684374-8bab748fbf90',
  '1592595896551-12b371d546d5',
  '1582268611958-ebfd161ef9cf',
  '1564013799919-ab600027ffc6',
  '1518780664697-55e3ad937233',
  '1449844908441-8829872d2607',
  '1576941089067-2de3c901e126',
  '1560518883-ce09059eeffa',
  '1560448204-603b3fc33ddc',
  '1585128792020-803d29415281',
  '1598300042247-d088f8ab3a91',
  '1598228723793-52759bba239c',
  '1605146769289-440113cc3d00',
  '1600047509358-9dc75507daeb',
  '1613490493576-7fde63acd811',
].map(unsplash)

export const VILLA_IMAGES = [
  '1613490493576-7fde63acd811',
  '1613977257363-707ba9348227',
  '1512918728675-ed5a9ecdebfd',
  '1600585154526-990dced4db0d',
  '1600566753086-00f18fb6b3ea',
  '1600607687920-4e2a09cf159d',
  '1600596542815-ffad4c1539a9',
  '1613977257592-4871e5fcd7c4',
  '1615874959474-d609969a20ed',
  '1600607687939-ce8a6c25118c',
  '1600566753190-17f0baa2a6c3',
  '1600585154340-be6161a56a0c',
  '1512917774080-9991f1c4c750',
  '1600607688969-a5bfcd646154',
  '1600047509807-ba8f99d2cdde',
].map(unsplash)

export const STUDIO_IMAGES = [
  '1536376072261-38c75010e6c9',
  '1560185893-a55cbc8c57e8',
  '1502005229762-cf1b2da7c5d6',
  '1586023492125-27b2c045efd7',
  '1493809842364-78817add7ffb',
  '1522708323590-d24dbb6b0261',
  '1560185007-c5ca9d2c014d',
  '1554995207-c18c203602cb',
  '1567767292278-a4f21aa2d36e',
].map(unsplash)

export const PENTHOUSE_IMAGES = [
  '1502672260266-1c1ef2d93688',
  '1600596542815-ffad4c1539a9',
  '1567496898669-ee935f5f647a',
  '1600566753190-17f0baa2a6c3',
  '1512917774080-9991f1c4c750',
  '1540518614846-7eded433c457',
  '1600607687939-ce8a6c25118c',
  '1600585154340-be6161a56a0c',
  '1600607687920-4e2a09cf159d',
  '1600121848594-d8644e57abab',
].map(unsplash)

export const COMMERCIAL_IMAGES = [
  '1497366216548-37526070297c',
  '1497366754035-f200968a6e72',
  '1524758631624-e2822e304c36',
  '1556761175-b413da4baf72',
  '1497215728101-856f4ea42174',
  '1542744173-8e7e53415bb0',
].map(unsplash)

export const OFFICE_IMAGES = [
  '1497366216548-37526070297c',
  '1497366811353-6870744d04b2',
  '1524758631624-e2822e304c36',
  '1497215728101-856f4ea42174',
  '1556761175-b413da4baf72',
  '1542744173-8e7e53415bb0',
].map(unsplash)

export const FALLBACK_IMAGE = unsplash('1600596542815-ffad4c1539a9')

// ═══════════════════════════════════════════════════════════════
// AVATARË PËR AGJENTË
// ═══════════════════════════════════════════════════════════════

export const MALE_AVATARS = [
  '1560250097-0b93528c311a',
  '1507003211169-0a1dd7228f2d',
  '1500648767791-00dcc994a43e',
  '1472099645785-5658abf4ff4e',
  '1519085360753-af0119f7cbe7',
  '1506794778202-cad84cf45f1d',
  '1492562080023-ab3db95bfbce',
  '1507591064344-4c6ce005b128',
  '1463453091185-61582044d556',
  '1504257432389-52343af06ae3',
].map(unsplashAvatar)

export const FEMALE_AVATARS = [
  '1573496359142-b8d87734a5a2',
  '1494790108377-be9c29b29330',
  '1438761681033-6461ffad8d80',
  '1544005313-94ddf0286df2',
  '1487412720507-e7ab37603c6f',
  '1531123897727-8f129e1688ce',
  '1499952127939-9bbf5af6c51c',
  '1489424731084-a5d8b219a5bb',
  '1541101767792-f9b2b1c4f127',
  '1534528741775-53994a69daeb',
].map(unsplashAvatar)

// ═══════════════════════════════════════════════════════════════
// FUNKSIONE
// ═══════════════════════════════════════════════════════════════

const IMAGE_POOLS: Record<string, string[]> = {
  apartment: APARTMENT_IMAGES,
  house: HOUSE_IMAGES,
  villa: VILLA_IMAGES,
  studio: STUDIO_IMAGES,
  penthouse: PENTHOUSE_IMAGES,
  commercial: COMMERCIAL_IMAGES,
  office: OFFICE_IMAGES,
}

export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false
  if (!url.startsWith('http')) return false
  if (url.length < 20) return false
  if (!url.includes('unsplash.com')) return false
  return true
}

export function pickImages(propertyType: string, count = 4): string[] {
  const pool = IMAGE_POOLS[propertyType] ?? APARTMENT_IMAGES
  const validPool = pool.filter(isValidImageUrl)

  if (validPool.length === 0) return [FALLBACK_IMAGE]

  const shuffled = [...validPool].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, Math.min(count, shuffled.length))

  return selected.length > 0 ? selected : [validPool[0]]
}

export function getPrimaryImage(images: string[] | null | undefined): string {
  if (!images || images.length === 0) return FALLBACK_IMAGE
  return images.find(isValidImageUrl) ?? FALLBACK_IMAGE
}

export function getAvatarUrl(
  name: string,
  gender: 'male' | 'female' = 'male'
): string {
  const photos = gender === 'male' ? MALE_AVATARS : FEMALE_AVATARS
  const index = name.charCodeAt(0) % photos.length
  return photos[index]
}