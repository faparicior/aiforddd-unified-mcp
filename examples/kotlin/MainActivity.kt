package com.example

import com.example.models.User
import com.example.services.UserService
import com.example.utils.Logger

class MainActivity {
    private val userService = UserService()
    private val logger = Logger()

    fun onCreate() {
        logger.info("MainActivity created")
        val user = userService.getCurrentUser()
        // ... rest of the code
    }
}