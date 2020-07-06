context("Input checks")

# The following tests have been converted to table tests in the test project R htmlwidgets.Q

test_that("Basic working scatterplot", {
    expect_error(LabeledScatter(X = 1:10, Y = 11:20, Z = 0:9,
                                label = letters[1:10]), NA)
})

test_that("Invalid X error", {
    msg <- "Input X needs to be a vector"
    expect_error(LabeledScatter(Y = 1:10, label = letters[1:10]), msg)
    expect_error(LabeledScatter(X = list(1:10), Y = 1:10,
                                label = letters[1:10]), msg)
    expect_error(LabeledScatter(X = matrix(1:10), Y = 1:10,
                                label = letters[1:10]), msg)
    expect_error(LabeledScatter(X = data.frame(1:10), Y = 1:10,
                                label = letters[1:10]), msg)
})

test_that("Invalid Y error", {
    msg <- "Input Y needs to be a vector"
    expect_error(LabeledScatter(X = 1:10, label = letters[1:10]), msg)
    expect_error(LabeledScatter(X = 1:10, Y = list(1:10),
                                label = letters[1:10]), msg)
    expect_error(LabeledScatter(X = 1:10, Y = matrix(1:10),
                                label = letters[1:10]), msg)
    expect_error(LabeledScatter(X = 1:10, Y = data.frame(1:10),
                                label = letters[1:10]), msg)
})

test_that("Invalid Z error", {
    msg <- "Input Z needs to be a vector of non-negative numbers"
    expect_error(LabeledScatter(X = 1:10, Y = 11:20, Z = letters[1:10],
                                label = letters[1:10]), msg)
    expect_error(LabeledScatter(X = 1:10, Y = 11:20, Z = -1:8,
                                label = letters[1:10]), msg)
})

test_that("Length of X and Y different", {
    msg <- "Inputs X and Y need to have the same length"
    expect_error(LabeledScatter(X = 1:10, Y = 1:20, label = letters[1:10]),
                 msg)
})

test_that("Length of Z different from X and Y", {
    msg <- "Input Z needs to have the same length as X and Y"
    expect_error(LabeledScatter(X = 1:10, Y = 11:20, Z = 1:3,
                                label = letters[1:10]), msg)
})
