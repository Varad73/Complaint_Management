import scala.io.StdIn.readLine

object ScalaExamples {

  // HELLO WORLD
  def helloWorld(): Unit = {
    println("Enter your name:")
    val name = readLine()
    println(s"Hello, $name!")
  }

  // FACTORIAL (recursive)
  def factorial(n: Int): BigInt = {
    if (n <= 1) 1
    else n * factorial(n - 1)
  }

  def factorialExample(): Unit = {
    println("Enter a number to calculate factorial:")
    val num = readLine().toInt
    println(s"Factorial of $num is ${factorial(num)}")
  }

  // WORD COUNT
  def wordCountExample(): Unit = {
    println("Enter a sentence for word count:")
    val sentence = readLine()
    val wordCounts = sentence.split("\\s+").groupBy(identity).mapValues(_.length)
    println("Word counts:")
    wordCounts.foreach { case (word, count) => println(s"$word -> $count") }
  }

  // BUBBLE SORT
  def bubbleSort(arr: Array[Int]): Array[Int] = {
    val n = arr.length
    for (i <- 0 until n) {
      for (j <- 0 until n - i - 1) {
        if (arr(j) > arr(j + 1)) {
          val temp = arr(j)
          arr(j) = arr(j + 1)
          arr(j + 1) = temp
        }
      }
    }
    arr
  }

  def bubbleSortExample(): Unit = {
    println("Enter numbers to sort (comma separated):")
    val input = readLine()
    val numbers = input.split(",").map(_.trim.toInt)
    val sorted = bubbleSort(numbers)
    println("Sorted array: " + sorted.mkString(", "))
  }

  def main(args: Array[String]): Unit = {
    helloWorld()
    factorialExample()
    wordCountExample()
    bubbleSortExample()
  }
}