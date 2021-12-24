import {GroupTreeVisitor} from '@compiler/grammar/tree/TreeGroupedVisitor';
import {CTypeCheckConfig} from '../constants';
import {ASTCCompilerNode} from '../../parser/ast/ASTCCompilerNode';
import {TypeCheckerContext} from './TypeCheckerContext';
import {TypeCheckScopeTree} from './TypeCheckScopeTree';
import {C_TYPES_VISITORS} from './visitors';

/**
 * Root typechecker visitor
 *
 * @export
 * @class TypeCheckerVisitor
 * @extends {GroupTreeVisitor<ASTCCompilerNode, any, TypeCheckerContext>}
 */
export class TypeCheckerVisitor extends GroupTreeVisitor<ASTCCompilerNode, any, TypeCheckerContext> {
  constructor(config: CTypeCheckConfig) {
    super(C_TYPES_VISITORS);
    this.setContext(
      {
        scope: new TypeCheckScopeTree,
        config,
      },
    );
  }

  get scope() {
    return this.context.scope;
  }
}
