function MultiplicationMatricesViewModel() {
    var self = this;

    self.maxDimension = 10;
    self.minDimension = 2;
    self.dimensionMatricesErrorMessage = "Такие матрицы нельзя перемножить, так как количество столбцов матрицы А не равно количеству строк матрицы В.";
    self.cellValueErrorMessage = "У множителей есть незаполненная ячейка(и), которую(ые) необходимо заполнить, чтобы выполнить операцию уможения матриц.";
    self.maxDimensionError = "Размерность матрицы не может быть больше" + self.maxDimension;
    self.minDimensionError = "Размерность матрицы не может быть меньше" + self.minDimension;

    self.__createEmptyMartix = function(rows, columns, placeholderVaue) {
        var arr = new Array();
        for (var i = 0; i < rows; i++) {
            arr[i] = ko.observableArray([]);
            for (var j = 0; j < columns; j++) {
                arr[i]()[j] = {
                    value: ko.observable(""),
                    placeholder: placeholderVaue + (i + 1) + ',' + (j + 1),
                };
            }
        }
        return arr;
    };

    self.__createMartixWith = function(placeholderVaue, matrixSource) {
        var rows = matrixSource.length;
        var columns = matrixSource[0]().length;

        var arr = new Array();
        for (var i = 0; i < rows; i++) {
            arr[i] = ko.observableArray([]);
            for (var j = 0; j < columns; j++) {
                arr[i]()[j] = {
                    value: matrixSource[i]()[j].value,
                    placeholder: placeholderVaue + (i + 1) + ',' + (j + 1),
                };
            }
        }
        return arr;
    };

    self.__setEmptyErrors = function() {
        self.errors.removeAll();
    };

    self.__canMultiplyMartices = function() {
        var rowLengthSecondMatrix = self.matrixB().length;
        var columnLengthFirstMartix = self.matrixA()[0]().length;
        if (rowLengthSecondMatrix != columnLengthFirstMartix)
            return false;
        return true;
    };

    self.__hasAnyEmptyCell = function() {
        var hasEmptyA = self.__hasMatrixEmptyValue(self.matrixA());
        if (hasEmptyA)
            return true;
        else {
            var hasEmptyB = self.__hasMatrixEmptyValue(self.matrixB());
            if (hasEmptyB)
                return true;
        }
        return false;
    };

    self.__hasMatrixEmptyValue = function(martix) {
        var result = $.grep(martix, function(row) {
            var emptyValues = $.grep(row(), function(col) {
                return col.value() === "";
            });
            return emptyValues.length;
        });
        if (result.length)
            return true;
        return false;
    };

    self.__transpose = function(matrix) {
        return matrix[0]().map(function(uselessValue, colIndex) {
            return matrix.map(function(uselessRow, rowIndex) {
                return matrix[rowIndex]()[colIndex];
            });
        });
    };

    self.__setEmptyMatrix = function(matrix) {
        var rows = matrix.length;
        var columns = matrix[0]().length;
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < columns; j++) {
                matrix[i]()[j].value("");
            }
        }
    };

    self.setEmpty = function() {
        self.__setEmptyErrors();

        self.__setEmptyMatrix(self.matrixA());
        self.__setEmptyMatrix(self.matrixB());
        self.__setEmptyMatrix(self.matrixC());
    };

    self.multiplyMatrices = function() {
        if (!self.__canMultiplyMartices()) {
            self.errors.push(self.dimensionMatricesErrorMessage);
        } else if (self.__hasAnyEmptyCell()) {
            self.errors.push(self.cellValueErrorMessage);
        } else {

            self.__setEmptyErrors();

            var rowLength = self.matrixA().length;
            var columnLength = self.matrixB()[0]().length;
            self.matrixC(self.__createEmptyMartix(rowLength, columnLength, "c"));

            var transposedMatrixB = self.__transpose(self.matrixB());
            var rowIndex = -1;
            self.matrixA().map(function(row) {
                rowIndex++;
                var columnIndex = -1;
                return transposedMatrixB.map(function(column) {
                    columnIndex++;
                    var newValue = column.reduce(function(sum, value, index) {
                        return sum + value.value() * row()[index].value();
                    }, 0);
                    self.matrixC()[rowIndex]()[columnIndex].value(newValue);
                    return newValue;
                });

            });
        }
    };

    self.change = function() {
        self.__setEmptyErrors();

        var oldMatrixA = self.matrixA();
        self.matricesToAction()[0].value(self.__createMartixWith("a", self.matrixB()));
        self.matricesToAction()[1].value(self.__createMartixWith("b", oldMatrixA));
    };

    self.addRow = function() {
        self.__setEmptyErrors();

        var rowLength = self.selectedMatrix().value().length;

        if (rowLength >= self.maxDimension) {
            self.errors.push(self.maxDimensionError);
        } else {
            var columnLength = self.selectedMatrix().value()[0]().length;
            var placeholderVaue = self.selectedMatrix().value()[0]()[0].placeholder.substring(0, 1);

            var newRow = ko.observableArray([]);
            for (var j = 0; j < columnLength; j++) {
                newRow.push({
                    value: ko.observable(""),
                    placeholder: placeholderVaue + (rowLength + 1) + ',' + (j + 1)
                });
            }
            self.selectedMatrix().value.push(newRow);
        }
    };

    self.removeRow = function() {
        self.__setEmptyErrors();

        var rowLength = self.selectedMatrix().value().length;
        if (rowLength === self.minDimension) {
            self.errors.push(self.minDimensionError);
        } else {
            self.selectedMatrix().value.pop();
        }
    };

    self.addCollumn = function() {
        self.__setEmptyErrors();

        var columnLength = self.selectedMatrix().value()[0]().length;
        if (columnLength >= self.maxDimension) {
            self.errors.push(self.maxDimensionError);
        } else {
            var placeholderVaue = self.selectedMatrix().value()[0]()[0].placeholder.substring(0, 1);
            var rowLength = self.selectedMatrix().value().length;

            for (var i = 0; i < rowLength; i++) {
                self.selectedMatrix().value()[i].push(
                {
                    value: ko.observable(""),
                    placeholder: placeholderVaue + (i + 1) + ',' + (columnLength + 1)
                });
            }
        }
    };

    self.removeCollumn = function() {
        self.__setEmptyErrors();

        var columnLength = self.selectedMatrix().value()[0]().length;
        if (columnLength === self.minDimension) {
            self.errors.push(self.minDimensionError);
        } else {

            var rowLength = self.selectedMatrix().value().length;
            for (var i = 0; i < rowLength; i++) {
                self.selectedMatrix().value()[i].pop();
            }
        }
    };

    self.doOnFocus = function() {
        self.__setEmptyErrors();

        self.isFocusInCell(true);
    };

    self.doOnBlur = function() {
        self.__setEmptyErrors();

        self.isFocusInCell(false);
    };

    self.hasError = function() {
        if (self.errors().length)
            return true;
        return false;
    };

    self.matrixA = ko.observableArray(self.__createEmptyMartix(2, 2, "a"));
    self.matrixB = ko.observableArray(self.__createEmptyMartix(2, 2, "b"));
    self.matrixC = ko.observableArray(self.__createEmptyMartix(2, 2, "c"));

    self.errors = ko.observableArray([]);

    self.matricesToAction = ko.observable([
        {
            displayedName: "A",
            key: "Матрица А",
            value: self.matrixA
        },
        {
            displayedName: "B",
            key: "Матрица B",
            value: self.matrixB
        }
    ]);
    self.isFocusInCell = ko.observable(false);

    self.selectedMatrix = ko.observable(self.matricesToAction()[0]);
}