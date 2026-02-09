package com.example.services

import com.example.models.User

interface UserServiceInterface {
    fun getCurrentUser(): User
    fun saveUser(user: User): User
}

interface AdvancedUserService : UserServiceInterface {
    fun getUsersByEmail(email: String): List<User>
}