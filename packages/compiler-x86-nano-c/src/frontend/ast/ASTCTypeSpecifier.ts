import {walkOverFields} from '@compiler/grammar/decorators/walkOverFields';

import {NodeLocation} from '@compiler/grammar/tree/NodeLocation';
import {Token} from '@compiler/lexer/tokens';
import {CTypeSpecifier} from '../../constants';
import {ASTCCompilerKind, ASTCCompilerNode} from './ASTCCompilerNode';
import {ASTCEnumSpecifier} from './ASTCEnumSpecifier';
import {ASTCStructSpecifier} from './ASTCStructSpecifier';

@walkOverFields(
  {
    fields: [
      'specifier',
      'typeName',
      'enumSpecifier',
      'structOrUnionSpecifier',
    ],
  },
)
export class ASTCTypeSpecifier extends ASTCCompilerNode {
  constructor(
    loc: NodeLocation,
    public readonly specifier?: CTypeSpecifier,
    public readonly typeName?: Token,
    public readonly enumSpecifier?: ASTCEnumSpecifier,
    public readonly structOrUnionSpecifier?: ASTCStructSpecifier,
  ) {
    super(ASTCCompilerKind.TypeSpecifier, loc);
  }

  get displayName() {
    const {specifier, typeName} = this;

    return (specifier || typeName?.text)?.trim();
  }

  /**
   * @returns
   * @memberof ASTCTypeSpecifier
   */
  toString() {
    const {kind, displayName} = this;

    return ASTCCompilerNode.dumpAttributesToString(
      kind,
      {
        displayName,
      },
    );
  }
}
