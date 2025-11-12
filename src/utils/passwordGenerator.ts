/**
 * Password Generation Utility
 * 
 * Generates secure, random passwords for user accounts.
 * Passwords are system-generated and cannot be set by users.
 */

/**
 * Generate a random password with specified length and complexity
 * 
 * @param length - Length of the password (default: 12)
 * @returns A randomly generated password
 */
export function generatePassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password to avoid predictable patterns
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Generate a memorable password (easier to type)
 * Format: Word-Word-Number-Symbol
 * Example: Blue-Sky-42-!
 * 
 * @returns A memorable password
 */
export function generateMemorablePassword(): string {
  const words = [
    'Blue', 'Red', 'Green', 'Yellow', 'Purple', 'Orange',
    'Sky', 'Ocean', 'Mountain', 'River', 'Forest', 'Desert',
    'Sun', 'Moon', 'Star', 'Cloud', 'Rain', 'Snow',
    'Lion', 'Tiger', 'Eagle', 'Wolf', 'Bear', 'Fox'
  ];
  
  const symbols = '!@#$%^&*';
  
  const word1 = words[Math.floor(Math.random() * words.length)];
  const word2 = words[Math.floor(Math.random() * words.length)];
  const number = Math.floor(Math.random() * 100);
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  
  return `${word1}-${word2}-${number}-${symbol}`;
}

/**
 * Validate password strength
 * 
 * @param password - Password to validate
 * @returns Object with validation result and message
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  message: string;
  strength: 'weak' | 'medium' | 'strong';
} {
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long',
      strength: 'weak'
    };
  }
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*]/.test(password);
  
  const criteriaCount = [hasUppercase, hasLowercase, hasNumber, hasSymbol].filter(Boolean).length;
  
  if (criteriaCount < 3) {
    return {
      isValid: false,
      message: 'Password must contain at least 3 of: uppercase, lowercase, number, symbol',
      strength: 'weak'
    };
  }
  
  if (criteriaCount === 3) {
    return {
      isValid: true,
      message: 'Password strength: Medium',
      strength: 'medium'
    };
  }
  
  return {
    isValid: true,
    message: 'Password strength: Strong',
    strength: 'strong'
  };
}
