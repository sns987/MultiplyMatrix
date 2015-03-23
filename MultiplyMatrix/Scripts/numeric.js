ko.bindingHandlers.numeric = {
    init: function (element, valueAccessor, allBindings) {
        ko.utils.registerEventHandler(element, "change", function () {
            var value = ko.utils.unwrapObservable(valueAccessor());
            var text = $.trim(value);

            var maxValue = allBindings.get('maxValue') || null;

            if (!$.isNumeric(text))
                $(element).val("");
            else if (maxValue != null && (text * 1) > maxValue) {
                $(element).val("");
            }

        });
    },
};