package com.example.repositories

import com.example.models.User

class UserRepository {
    fun findById(id: Long): User {
        return User(id, "Test User", "test@example.com")
    }

    fun save(user: User): User {
        return user
    }
}
