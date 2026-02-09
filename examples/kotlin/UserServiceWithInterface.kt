package com.example.services

import com.example.models.User
import com.example.repositories.UserRepository
import com.example.services.UserServiceInterface

class UserService : UserServiceInterface {
    private val userRepository = UserRepository()

    override fun getCurrentUser(): User {
        return userRepository.findById(1L)
    }

    override fun saveUser(user: User): User {
        return userRepository.save(user)
    }
}