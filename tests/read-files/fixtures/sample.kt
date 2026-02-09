package com.example.library

import com.example.library.domain.Book
import com.example.library.domain.BookId
import com.example.library.domain.BookRepository
import com.example.library.domain.ISBN
import com.example.library.domain.Author
import java.util.UUID
import org.slf4j.LoggerFactory

class BookService(private val bookRepository: BookRepository) {
  private val logger = LoggerFactory.getLogger(BookService::class.java)

  fun addBook(request: AddBookRequest) {
    runCatching {
        logger.info("[BookService] Adding book: ${request.title}")
        request.toDomainBook().let(bookRepository::save)
      }
      .onFailure {
        logger.error("[BookService] ${it.message}", it)
        throw it
      }
  }

  private fun AddBookRequest.toDomainBook() =
    Book(
      id = BookId(UUID.fromString(id)),
      isbn = ISBN(isbn),
      title = title,
      author = Author(author))
}

data class AddBookRequest(val id: String, val isbn: String, val title: String, val author: String)