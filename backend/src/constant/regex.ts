export const ALPHA_NUMERIC = /^[a-zA-Z0-9]+$/;
export const ONE_LETTER = /[a-zA-Z]+/;
export const ONE_NUMBER = /[0-9]+/;
export const ONE_LOWERCASE_LETTER = /[a-z]+/;
export const ONE_UPPERCASE_LETTER = /[A-Z]+/;
export const ONE_SPECIAL_CHARACTER = /[@$!%*?&]+/;
export const ALPHA_NUMERIC_WITH_ENYE = /[^a-zA-Z0-9ñÑ\s.,-]+$/;
export const NOT_DOMAIN =
  /\b([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?\b/;
