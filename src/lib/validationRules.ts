/**
 * Strict Form Validation & Colombian Telephony Rules for StreamBox
 * Enforces zero-ambiguity standards for:
 * 1. Colombian Mobile/WhatsApp Numbers (+57 3XX XXX XXXX)
 * 2. Payment References (Anti-garbage, alphanumeric 6-18)
 * 3. Strict RFC Email & Disposable Domain Blocking
 * 4. 6-Digit Numeric OTP
 */

// Banned garbage payment reference patterns
const GARBAGE_REFERENCE_PATTERNS = [
  '123456',
  '1234567',
  '12345678',
  '000000',
  '111111',
  '222222',
  '333333',
  '444444',
  '555555',
  '666666',
  '777777',
  '888888',
  '999999',
  'AAAAAA',
  'BBBBBB',
  'CCCCCC',
  'ASDFGH',
  'QWERTY',
  'PRUEBA',
  'TEST',
  'PAGO',
  'NEQUI',
  'DAVIPLATA',
  'BANCOLOMBIA',
  'COMPROBANTE',
  'TRANSFERENCIA',
];

// Blocked temporary or incomplete domains
const BLOCKED_EMAIL_DOMAINS = [
  'test.com',
  'test.co',
  'mail.com',
  'example.com',
  'fake.com',
  'temp.com',
  'tempmail.com',
  '10minutemail.com',
  'throwawaymail.com',
  'guerrillamail.com',
  'yopmail.com',
  'sharklasers.com',
  'mailinator.com',
  'dispostable.com',
];

/**
 * Validates a Colombian mobile number:
 * - Length: exactly 10 digits (ignoring spaces or optional +57 prefix)
 * - Must start with 3 (prefixes: 300, 301, 302, 304, 305, 310-324, 350, 351)
 * - Regex: /^(?:\+57)?3[0-2,5]\d{8}$/
 */
export function validateColombianPhone(phone: string): {
  isValid: boolean;
  cleanDigits: string;
  errorMessage?: string;
} {
  const clean = phone.replace(/[\s\-\(\)\.]/g, '');
  if (!clean) {
    return { isValid: false, cleanDigits: '', errorMessage: 'El número móvil es requerido.' };
  }

  // Remove leading +57 if present
  let normalized = clean;
  if (normalized.startsWith('+57')) {
    normalized = normalized.slice(3);
  } else if (normalized.startsWith('57') && normalized.length === 12) {
    normalized = normalized.slice(2);
  }

  // Check if starts with 3
  if (!normalized.startsWith('3')) {
    return {
      isValid: false,
      cleanDigits: normalized,
      errorMessage: 'Ingresa un número móvil válido de Colombia (10 dígitos que empiece por 3).',
    };
  }

  // Check valid length
  if (normalized.length !== 10) {
    return {
      isValid: false,
      cleanDigits: normalized,
      errorMessage: `Ingresa un número móvil válido de Colombia (10 dígitos que empiece por 3). Llevas ${normalized.length} dígitos.`,
    };
  }

  // Check operator prefix regex: 300-305, 310-324, 350-351
  const colombiaMobileRegex = /^3[0-2,5]\d{8}$/;
  if (!colombiaMobileRegex.test(normalized)) {
    return {
      isValid: false,
      cleanDigits: normalized,
      errorMessage: 'El prefijo móvil no corresponde a un operador colombiano autorizado (ej. 300, 301, 310, 320, 350).',
    };
  }

  return { isValid: true, cleanDigits: normalized };
}

/**
 * Formats a phone number live as the user types: `300 123 4567`
 */
export function formatColombianPhoneLive(value: string): string {
  // Allow optional leading +57
  const hasPlus57 = value.trim().startsWith('+57');
  const digits = value.replace(/\D/g, '');
  
  // If user included 57 at start, strip it for internal 10-digit grouping
  let phoneDigits = digits;
  if (hasPlus57 && phoneDigits.startsWith('57')) {
    phoneDigits = phoneDigits.slice(2);
  } else if (phoneDigits.length === 12 && phoneDigits.startsWith('57')) {
    phoneDigits = phoneDigits.slice(2);
  }

  // Limit to 10 digits
  const truncated = phoneDigits.slice(0, 10);

  // Group as 3XX XXX XXXX
  let formatted = '';
  if (truncated.length > 0) {
    formatted = truncated.slice(0, 3);
  }
  if (truncated.length > 3) {
    formatted += ' ' + truncated.slice(3, 6);
  }
  if (truncated.length > 6) {
    formatted += ' ' + truncated.slice(6, 10);
  }

  return hasPlus57 ? `+57 ${formatted}`.trim() : formatted;
}

/**
 * Validates a Payment Reference / Voucher number:
 * - Length: 6 to 18 alphanumeric characters
 * - Regex: /^[A-Za-z0-9\-_]{6,18}$/
 * - Rejects obvious repetitions or garbage (123456, 000000, aaaaaa, prueba, etc.)
 */
export function validatePaymentReference(rawReference: string): {
  isValid: boolean;
  cleanReference: string;
  errorMessage?: string;
} {
  const clean = rawReference.trim().toUpperCase();

  if (!clean) {
    return {
      isValid: false,
      cleanReference: '',
      errorMessage: 'La referencia de pago es requerida.',
    };
  }

  if (clean.length < 6 || clean.length > 18) {
    return {
      isValid: false,
      cleanReference: clean,
      errorMessage: 'La referencia de pago debe tener entre 6 y 18 caracteres alfanuméricos (letras y números sin espacios).',
    };
  }

  const alphanumericRegex = /^[A-Z0-9\-_]{6,18}$/;
  if (!alphanumericRegex.test(clean)) {
    return {
      isValid: false,
      cleanReference: clean,
      errorMessage: 'La referencia de pago solo debe contener letras, números, guiones y sin caracteres especiales.',
    };
  }

  // Check garbage patterns
  if (GARBAGE_REFERENCE_PATTERNS.includes(clean)) {
    return {
      isValid: false,
      cleanReference: clean,
      errorMessage: 'Referencia inválida. Por favor ingresa el código real de aprobación de tu comprobante bancario.',
    };
  }

  // Check if all characters are identical (e.g. 1111111, ZZZZZZ)
  const allIdentical = clean.split('').every((char) => char === clean[0]);
  if (allIdentical) {
    return {
      isValid: false,
      cleanReference: clean,
      errorMessage: 'Referencia inválida. No se permiten caracteres idénticos repetidos.',
    };
  }

  return { isValid: true, cleanReference: clean };
}

/**
 * Strict RFC Email format validation & disposable domain blocking
 */
export function validateStrictEmail(email: string): {
  isValid: boolean;
  cleanEmail: string;
  errorMessage?: string;
} {
  const clean = email.trim().toLowerCase();

  if (!clean) {
    return { isValid: false, cleanEmail: '', errorMessage: 'El correo electrónico es obligatorio.' };
  }

  // Strict RFC 5322 regex
  const rfcEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!rfcEmailRegex.test(clean)) {
    return {
      isValid: false,
      cleanEmail: clean,
      errorMessage: 'Ingresa una dirección de correo electrónico válida (ejemplo: usuario@gmail.com).',
    };
  }

  const domain = clean.split('@')[1];
  if (!domain || !domain.includes('.')) {
    return {
      isValid: false,
      cleanEmail: clean,
      errorMessage: 'El dominio del correo está incompleto o es inválido.',
    };
  }

  if (BLOCKED_EMAIL_DOMAINS.includes(domain)) {
    return {
      isValid: false,
      cleanEmail: clean,
      errorMessage: 'No se admiten correos temporales o de prueba. Usa un correo real (Gmail, Hotmail, etc.).',
    };
  }

  return { isValid: true, cleanEmail: clean };
}

/**
 * Validates a 6-digit numeric OTP code
 */
export function validateOTPCode(otp: string): {
  isValid: boolean;
  cleanCode: string;
  errorMessage?: string;
} {
  const clean = otp.replace(/\D/g, '').slice(0, 6);
  if (clean.length !== 6) {
    return {
      isValid: false,
      cleanCode: clean,
      errorMessage: `El código debe tener exactamente 6 dígitos numéricos. Llevas ${clean.length}.`,
    };
  }
  return { isValid: true, cleanCode: clean };
}
