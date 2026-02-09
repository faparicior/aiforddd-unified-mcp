package com.example.parity

const val TOP_LEVEL_STRING = "top-level"
const val TOP_LEVEL_INT = 42
const val TOP_LEVEL_BOOL = true

interface BaseInterface {
    fun interfaceMethod()
}

class ParityClass(val constructorVal: String, var constructorVar: Int) : BaseInterface {
    val classVal: String = "val"
    var classVar: Int = 0

    override fun interfaceMethod() {
        // implementation
    }

    fun normalMethod() {
        // implementation
    }

    companion object {
        const val COMPANION_STRING = "companion"
        const val COMPANION_INT = 100
        const val COMPANION_BOOL = false
    }
}
