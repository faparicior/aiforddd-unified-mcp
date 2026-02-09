<?php

namespace App\Parity;

#[ClassAttribute]
class ParityClass {
    #[PropertyAttribute]
    public readonly string $readonlyProp;

    public int $mutableProp = 1;

    #[MethodAttribute]
    public function method() {}

    public function normalMethod() {}
}

const TOP_LEVEL_CONST = "top-level";
