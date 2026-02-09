package com.example.repositories

import com.example.models.User
import com.example.database.DatabaseHelper

class UserRepository {
    private val dbHelper = DatabaseHelper()

    fun findById(id: Long): User {
        // Simulate database query
        return User(id, "John Doe", "john@example.com")
    }

    fun save(user: User): User {
        // Simulate database save
        return user
    }
}