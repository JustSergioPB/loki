export function getFullInitials(fullName: string): string {
  if (!fullName) return "";

  // Remove extra spaces and split the name
  const names = fullName.trim().split(/\s+/);

  if (names.length === 1) {
    // If only one name, return its first letter
    return names[0].charAt(0).toUpperCase();
  }

  // Get first letter of first and last name
  const firstInitial = names[0].charAt(0);
  const lastInitial = names[names.length - 1].charAt(0);

  return (firstInitial + lastInitial).toUpperCase();
}
