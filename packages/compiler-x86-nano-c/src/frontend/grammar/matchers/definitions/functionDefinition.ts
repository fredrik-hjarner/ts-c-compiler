import {ASTCFunctionDefinition} from '../../../ast';
import {CGrammar} from '../shared';

import {declarationSpecifiers} from '../specifiers/declarationSpecifiers';
import {declarator} from '../declarations/declarator';
import {declarationList} from '../declarations/declarationList';
import {compoundStatement} from '../statements/compoundStatement';

/**
 * function_definition
 *  : declaration_specifiers declarator declaration_list compound_statement
 *  | declaration_specifiers declarator compound_statement
 *  ;
 *
 * @export
 * @param {CGrammar} grammar
 */
export function functionDefinition(grammar: CGrammar): ASTCFunctionDefinition {
  const {g} = grammar;

  const specifier = declarationSpecifiers(grammar);
  const declaratorNode = declarator(grammar);
  const declarationListNode = g.try(() => declarationList(grammar));
  const compoundStatementNode = compoundStatement(grammar);

  return new ASTCFunctionDefinition(
    specifier.loc,
    specifier,
    declaratorNode,
    declarationListNode,
    compoundStatementNode,
  );
}
