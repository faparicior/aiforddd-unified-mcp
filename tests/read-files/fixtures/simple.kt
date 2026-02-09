package com.example.calculator

import com.example.calculator.domain.Result
import com.example.calculator.domain.Operation

class Calculator {
    fun add(a: Int, b: Int): Int {
        return a + b
    }
    
    fun multiply(x: Double, y: Double): Double {
        return x * y
    }
}

data class CalculationResult(val value: Double, val operation: String)