export const TOP_LEVEL_CONST = "top-level"

@ClassDecorator
export class ParityClass {
  @PropertyDecorator
  readonly readonlyProp: string = "readonly"
  
  mutableProp: number = 1

  constructor(
      @ParamDecorator public readonly ctorReadonly: string,
      public ctorMutable: number
  ) {}

  @MethodDecorator
  override method() {}

  normalMethod() {}
}
