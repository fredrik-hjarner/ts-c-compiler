import * as R from 'ramda';

import {TokensIterator} from '@compiler/grammar/tree/TokensIterator';
import {
  Token,
  TokenType,
} from '@compiler/lexer/tokens';

import {
  GrammarError,
  GrammarErrorCode,
} from '@compiler/grammar/GrammarError';

import {TreeVisitor} from '@compiler/grammar/tree/TreeVisitor';
import {ASTPreprocessorNode, isStatementPreprocessorNode} from '../constants';
import {ASTPreprocessorCallable} from '../nodes';
import {fetchRuntimeCallArgsList} from './utils/fetchRuntimeCallArgsList';

export type InterpreterResult = string | number | boolean | void;

export interface PreprocessorInterpretable {
  exec(interpreter: PreprocessorInterpreter): InterpreterResult;
  toEmitterLine(): string;
}

export class PreprocessorInterpreter {
  private _callable = new Map<string, ASTPreprocessorCallable>();

  /**
   * Evaluates all macros, replaces them with empty lines
   *
   * @see
   *  Preserves lines numbers but not columns!
   *
   * @param {ASTPreprocessorNode} ast
   * @returns {string}
   * @memberof PreprocessorInterpreter
   */
  exec(ast: ASTPreprocessorNode): string {
    let acc = '';

    this.clear();
    ast.exec(this);

    const visitor = new (class extends TreeVisitor<ASTPreprocessorNode> {
      enter(node: ASTPreprocessorNode) {
        if (!isStatementPreprocessorNode(node))
          return;

        if (this.nesting === 2)
          acc += node.toEmitterLine();
        acc += '\n';
      }
    });

    visitor.visit(ast);
    return acc;
  }

  /**
   * Declares function that can be executed in ASTPreprocessorSyntaxLine
   *
   * @todo
   *  Handle already defined macro
   *
   * @param {ASTPreprocessorCallable} callable
   * @returns {this}
   * @memberof PreprocessorInterpreter
   */
  defineRuntimeCallable(callable: ASTPreprocessorCallable): this {
    if (this.isCallable(callable.name)) {
      throw new GrammarError(
        GrammarErrorCode.MACRO_ALREADY_EXISTS,
        null,
        {
          name: callable.name,
        },
      );
    }

    this._callable.set(callable.name, callable);
    return this;
  }

  /**
   * Checks if symbol is callable
   *
   * @param {string} name
   * @returns {boolean}
   * @memberof PreprocessorInterpreter
   */
  isCallable(name: string): boolean {
    return this._callable.has(name);
  }

  /**
   * Calls defined function
   *
   * @todo
   *  Handle missing method
   *
   * @param {string} name
   * @param {string[]} [args=[]]
   * @returns {string}
   * @memberof PreprocessorInterpreter
   */
  runtimeCall(name: string, args: string[] = []): string {
    return this._callable.get(name).runtimeCall(args);
  }

  /**
   * Removes all macro calls from list of tokens
   *
   * @param {Token[]} tokens
   * @returns {[boolean, Token[]]}
   * @memberof PreprocessorInterpreter
   */
  evalTokensList(tokens: Token[]): [boolean, Token[]] {
    let newTokens: Token[] = [...tokens];
    let foundMacro: boolean = false;

    for (let i = 0; i < newTokens.length; ++i) {
      const token = newTokens[i];
      if (token.type !== TokenType.KEYWORD || !this.isCallable(token.text))
        continue;

      // nested eval of macro, arguments might contain macro
      const it = new TokensIterator(newTokens, i + 1);
      const args = (
        newTokens[i + 1]?.text === '('
          ? fetchRuntimeCallArgsList(it).map((argTokens) => this.evalTokensList(argTokens)[1])
          : []
      );
      const callResult = this.runtimeCall(
        token.text,
        R.map(
          (argTokens) => R.pluck('text', argTokens).join(''),
          args,
        ),
      );

      foundMacro = true;
      newTokens = [
        ...newTokens.slice(0, i),
        new Token(
          TokenType.KEYWORD,
          null,
          callResult,
          tokens[i].loc,
        ),
        ...newTokens.slice(it.getTokenIndex() + +args.length), // +args.length, if args.length > 0 there must be ()
      ];
    }

    return [foundMacro, newTokens];
  }

  /**
   * Resets interpereter state
   *
   * @memberof PreprocessorInterpreter
   */
  clear() {
    const {_callable} = this;

    _callable.clear();
  }
}
