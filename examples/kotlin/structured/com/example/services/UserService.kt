package com.example.services

import com.example.models.User
import com.example.repositories.UserRepository

class UserService {
    private val userRepository = UserRepository()

    fun getCurrentUser(): User {
        return userRepository.findById(1L)
    }

    fun saveUser(user: User): User {
        return userRepository.save(user)
    }
}
