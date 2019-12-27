#@applitools @rerender
#Feature: Multiple Calls to Render Value
#  Multiple calls to renderValue should leave the widget in a good state. Updates to the config should be rendered, and there should not be multiple widgets created or remnants of the original config left over.
#
#  Scenario: Rerender Test
#    Given I am viewing "scatterplot_three_point_brand" with dimensions 1000x600 and rerender controls
#    When I rerender with config "scatterplot_three_point_brand"
#    Then the "scatterplot_three_point_brand_initial_load" snapshot matches the baseline
#    When I rerender with config "scatterplot_four_point_brand"
#    Then the "scatterplot_four_point_brand_initial_load" snapshot matches the baseline