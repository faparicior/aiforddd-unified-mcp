package com.example

import com.example.services.UserServiceInterface

class InterfaceUser {
    private val service: UserServiceInterface? = null

    fun useService() {
        service?.getCurrentUser()
    }
}