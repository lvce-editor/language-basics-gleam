/**
 * @enum number
 */
export const State = {
  TopLevelContent: 1,
  InsideDoubleQuoteString: 2,
}

export const StateMap = {
  [State.TopLevelContent]: 'TopLevelContent',
  [State.InsideDoubleQuoteString]: 'InsideDoubleQuoteString',
}

/**
 * @enum number
 */
export const TokenType = {
  None: 1,
  Whitespace: 2,
  Punctuation: 3,
  String: 4,
  Keyword: 5,
  KeywordControl: 6,
  KeywordImport: 7,
  Numeric: 8,
  VariableName: 9,
  FunctionName: 10,
  Type: 11,
  LanguageConstant: 12,
  Comment: 13,
  AttributeName: 14,
  Text: 15,
}

export const TokenMap = {
  [TokenType.None]: 'None',
  [TokenType.Whitespace]: 'Whitespace',
  [TokenType.Punctuation]: 'Punctuation',
  [TokenType.String]: 'String',
  [TokenType.Keyword]: 'Keyword',
  [TokenType.KeywordControl]: 'KeywordControl',
  [TokenType.KeywordImport]: 'KeywordImport',
  [TokenType.Numeric]: 'Numeric',
  [TokenType.VariableName]: 'VariableName',
  [TokenType.FunctionName]: 'Function',
  [TokenType.Type]: 'Type',
  [TokenType.LanguageConstant]: 'LanguageConstant',
  [TokenType.Comment]: 'Comment',
  [TokenType.AttributeName]: 'AttributeName',
  [TokenType.Text]: 'Text',
}

const RE_WHITESPACE = /^\s+/
const RE_LINE_COMMENT = /^\/\/.*/
const RE_DOUBLE_QUOTE = /^"/
const RE_STRING_CONTENT = /^[^"\\]+/
const RE_STRING_ESCAPE = /^\\(?:u\{[\da-fA-F]*\}|.)/
const RE_BACKSLASH = /^\\/
const RE_LANGUAGE_CONSTANT = /^(?:False|Nil|True)\b/
const RE_KEYWORD =
  /^(?:as|assert|auto|case|const|delegate|derive|echo|else|fn|if|implement|import|let|macro|opaque|panic|pub|test|todo|type|use)\b/
const RE_ATTRIBUTE = /^@[a-z][a-z\d_]*/
const RE_NUMBER =
  /^(?:0[xX][\da-fA-F](?:_?[\da-fA-F])*|0[oO][0-7](?:_?[0-7])*|0[bB][01](?:_?[01])*|\d(?:_?\d)*(?:\.\d(?:_?\d)*)?(?:e-?\d(?:_?\d)*)?)/
const RE_FUNCTION_NAME = /^[a-z_][a-z\d_]*(?=\s*\()/
const RE_TYPE_NAME = /^[A-Z][a-zA-Z\d_]*/
const RE_VARIABLE_NAME = /^[a-z_][a-z\d_]*/
const RE_PUNCTUATION =
  /^(?:<=\.|>=\.|<\.|>\.|\+\.|-\.|\/\.|\*\.|<-|->|\|>|\.\.|==|!=|<=|>=|&&|\|\||<>|<<|>>|[()[\]{},:#!@.;?~%^&*+\-=|<>\/])/
const RE_ANY_CHARACTER = /^./u

export const initialLineState = {
  state: State.TopLevelContent,
}

export const hasArrayReturn = true

/**
 * @param {any} lineStateA
 * @param {any} lineStateB
 */
export const isEqualLineState = (lineStateA, lineStateB) => {
  return lineStateA.state === lineStateB.state
}

/**
 * @param {string} keyword
 */
const getKeywordToken = (keyword) => {
  switch (keyword) {
    case 'case':
    case 'else':
    case 'if':
      return TokenType.KeywordControl
    case 'import':
      return TokenType.KeywordImport
    default:
      return TokenType.Keyword
  }
}

/**
 * @param {string} line
 * @param {any} lineState
 */
export const tokenizeLine = (line, lineState) => {
  let index = 0
  let state = lineState.state
  const tokens = []
  while (index < line.length) {
    const part = line.slice(index)
    let next
    let token
    switch (state) {
      case State.TopLevelContent:
        if ((next = part.match(RE_WHITESPACE))) {
          token = TokenType.Whitespace
        } else if ((next = part.match(RE_LINE_COMMENT))) {
          token = TokenType.Comment
        } else if ((next = part.match(RE_DOUBLE_QUOTE))) {
          token = TokenType.Punctuation
          state = State.InsideDoubleQuoteString
        } else if ((next = part.match(RE_LANGUAGE_CONSTANT))) {
          token = TokenType.LanguageConstant
        } else if ((next = part.match(RE_KEYWORD))) {
          token = getKeywordToken(next[0])
        } else if ((next = part.match(RE_ATTRIBUTE))) {
          token = TokenType.AttributeName
        } else if ((next = part.match(RE_NUMBER))) {
          token = TokenType.Numeric
        } else if ((next = part.match(RE_FUNCTION_NAME))) {
          token = TokenType.FunctionName
        } else if ((next = part.match(RE_TYPE_NAME))) {
          token = TokenType.Type
        } else if ((next = part.match(RE_VARIABLE_NAME))) {
          token = TokenType.VariableName
        } else if ((next = part.match(RE_PUNCTUATION))) {
          token = TokenType.Punctuation
        } else if ((next = part.match(RE_ANY_CHARACTER))) {
          token = TokenType.Text
        } else {
          throw new Error('Failed to tokenize Gleam source')
        }
        break
      case State.InsideDoubleQuoteString:
        if ((next = part.match(RE_DOUBLE_QUOTE))) {
          token = TokenType.Punctuation
          state = State.TopLevelContent
        } else if ((next = part.match(RE_STRING_CONTENT))) {
          token = TokenType.String
        } else if ((next = part.match(RE_STRING_ESCAPE))) {
          token = TokenType.String
        } else if ((next = part.match(RE_BACKSLASH))) {
          token = TokenType.String
        } else {
          throw new Error('Failed to tokenize Gleam string')
        }
        break
      default:
        throw new Error('Invalid Gleam tokenizer state')
    }
    index += next[0].length
    tokens.push(token, next[0].length)
  }
  return {
    state,
    tokens,
  }
}
