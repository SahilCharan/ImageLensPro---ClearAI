/**
 * Password Generator for n8n
 * 
 * This function generates memorable, secure passwords in the format:
 * Word-Word-Number (e.g., "Happy-Cloud-42")
 * 
 * Usage in n8n:
 * 1. Add a "Code" node (JavaScript)
 * 2. Copy this entire function
 * 3. Call generatePassword() to get a password
 * 4. Return the password in the items array
 */

function generatePassword() {
  const adjectives = [
    'Happy', 'Sunny', 'Clever', 'Bright', 'Swift',
    'Gentle', 'Brave', 'Calm', 'Bold', 'Wise',
    'Quick', 'Smart', 'Kind', 'Noble', 'Proud',
    'Silent', 'Golden', 'Silver', 'Crystal', 'Diamond',
    'Mighty', 'Royal', 'Grand', 'Epic', 'Prime',
    'Super', 'Ultra', 'Mega', 'Hyper', 'Turbo'
  ];

  const nouns = [
    'Cloud', 'River', 'Mountain', 'Ocean', 'Forest',
    'Eagle', 'Tiger', 'Dragon', 'Phoenix', 'Lion',
    'Star', 'Moon', 'Sun', 'Sky', 'Storm',
    'Thunder', 'Lightning', 'Wind', 'Fire', 'Water',
    'Knight', 'Warrior', 'Guardian', 'Champion', 'Hero',
    'Crown', 'Sword', 'Shield', 'Arrow', 'Spear'
  ];

  // Get random adjective
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  
  // Get random noun
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  // Get random number between 10 and 99
  const number = Math.floor(Math.random() * 90) + 10;
  
  // Combine into password
  return `${adjective}-${noun}-${number}`;
}

// For n8n: Return the generated password
const password = generatePassword();

// n8n expects items array
return [
  {
    json: {
      password: password,
      timestamp: new Date().toISOString()
    }
  }
];

/**
 * Example outputs:
 * - Happy-Cloud-42
 * - Brave-Dragon-73
 * - Swift-Eagle-28
 * - Golden-Phoenix-91
 * - Mighty-Thunder-56
 */
