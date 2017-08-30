Feature: State Interactions
  Interaction should cause a state callback, and when I rerender with that new state value, I should see the same state as caused by the interaction

  @applitools @state
  Scenario: User can drag a scatterplot label on the canvas
    Given I am viewing "scatterplot_three_point_brand" with dimensions 1000x600
    Then the "scatterplot_three_point_brand_initial_load" snapshot matches the baseline
    When I drag label 0 by 50 x 50
    Then label 0 should stay in the new location
    And the "scatterplot_three_point_brand_after_label_drag" snapshot matches the baseline
    And the final state callback should match "porche_label_moved_50x50" within 3

  @applitools @state
  Scenario: User can load a scatterplot label with saved state (user drag label on canvas) and see their modified scatterplot
    Given I am viewing "scatterplot_three_point_brand" with state "porche_label_moved_50x50" and dimensions 1000x600
    Then the "scatterplot_three_point_brand_after_label_drag" snapshot matches the baseline


  @applitools @state
  Scenario: User can drag a scatterplot label off of the canvas
    Given I am viewing "scatterplot_three_point_brand" with dimensions 1000x600
    And I wait for animations to complete
    When I drag label 0 to the legend
    Then label 0 should be in the legend
    And the "scatterplot_three_point_brand_after_label_drag_to_legend" snapshot matches the baseline
    And the final state callback should match "porche_label_moved_to_legend" within 0.02

  @applitools @state
  Scenario: User can load a scatterplot label with saved state (user drag label to legend) and see their modified scatterplot
    Given I am viewing "scatterplot_three_point_brand" with state "porche_label_moved_to_legend" and dimensions 1000x600
    Then the "scatterplot_three_point_brand_after_label_drag_to_legend" snapshot matches the baseline


  @applitools @state
  Scenario: User can drag a scatterplot label from the legend back to the canvas and it will snap into the original position
    Given I am viewing "scatterplot_three_point_brand" with state "porche_label_moved_to_legend" and dimensions 1000x600
    When I drag legend label 0 to the canvas
    Then label 0 should be near the circle anchor 0
    And the "scatterplot_three_point_brand_initial_load" snapshot matches the baseline
    And the final state callback should match "back_to_original" within 0


  @applitools @state @imageLabels
  Scenario: User can drag a scatterplot image label on the canvas
    Given I am viewing "scatterplot_three_point_brand" with dimensions 1000x600
    Then the "scatterplot_three_point_brand_initial_load" snapshot matches the baseline
    When I drag label 2 by 200 x 100
    Then label 2 should stay in the new location
    And the "scatterplot_three_point_brand_after_apple_logo_drag" snapshot matches the baseline
    And the final state callback should match "apple_logo_moved_200x100" within 0.02

  @applitools @state @imageLabels
  Scenario: User can load a scatterplot image label with saved state (user drag image label on canvas) and see their modified scatterplot
    Given I am viewing "scatterplot_three_point_brand" with state "apple_logo_moved_200x100" and dimensions 1000x600
    Then the "scatterplot_three_point_brand_after_apple_logo_drag" snapshot matches the baseline

  @applitools @state @imageLabels
  Scenario: User can drag a scatterplot image label off of the canvas
    Given I am viewing "scatterplot_three_point_brand" with dimensions 1000x600
    When I drag label 2 to the legend
    Then label 2 should be in the legend
    And the "scatterplot_three_point_brand_after_apple_logo_moved_to_legend" snapshot matches the baseline
    And the final state callback should match "apple_logo_moved_to_legend" within 0.02

  @applitools @state @imageLabels
  Scenario: User can load a scatterplot image label with saved state (image label moved to legend) and see their modified scatterplot
    Given I am viewing "scatterplot_three_point_brand" with state "apple_logo_moved_to_legend" and dimensions 1000x600
    Then the "scatterplot_three_point_brand_after_apple_logo_moved_to_legend" snapshot matches the baseline

  @applitools @state @imageLabels
  Scenario: User can drag a scatterplot image label from the legend back to the canvas and it will snap into the original position
    Given I am viewing "scatterplot_three_point_brand" with state "apple_logo_moved_to_legend" and dimensions 1000x600
    When I drag legend label 2 to the canvas
    Then label 2 should be near the circle anchor 2
    And the "scatterplot_three_point_brand_initial_load" snapshot matches the baseline
    And the final state callback should match "back_to_original" within 0

  @applitools @state @bubbleplot
  Scenario: User can drag a bubbleplot label on the canvas
    Given I am viewing "bubbleplot_simple" with dimensions 600x600
    Then the "bubbleplot_simple_initial_load" snapshot matches the baseline
    When I drag label 2 by 100 x 100
    Then label 2 should stay in the new location
    And the "bubbleplot_simple_label_moved_100x100" snapshot matches the baseline
    And the final state callback should match "label_moved_100x100" within 2

  @applitools @state @bubbleplot
  Scenario: User can load a bubbleplot with saved state (label drag on canvas) and see their modified bubbleplot
    Given I am viewing "bubbleplot_simple" with state "label_moved_100x100" and dimensions 600x600
    Then the "bubbleplot_simple_label_moved_100x100" snapshot matches the baseline

  @applitools @state @bubbleplot
  Scenario: User can drag a bubbleplot label off of the canvas
    Given I am viewing "bubbleplot_simple" with dimensions 600x600
    And I wait for animations to complete
    When I drag label 2 to the legend
    Then label 2 should be in the legend
    And the "bubbleplot_simple_after_label_moved_to_legend" snapshot matches the baseline
    And the final state callback should match "label_moved_to_legend" within 2

  @applitools @state @bubbleplot
  Scenario: User can load a bubbleplot label with saved state (label moved to legend) and see their modified scatterplot
    Given I am viewing "bubbleplot_simple" with state "label_moved_to_legend" and dimensions 600x600
    Then the "label_moved_to_legend" snapshot matches the baseline

  @applitools @state @bubbleplot
  Scenario: User can drag a bubbleplot label from the legend back to the canvas and it will snap into the original position
    Given I am viewing "bubbleplot_simple" with state "label_moved_to_legend" and dimensions 600x600
    When I drag legend label 2 to the canvas
    Then label 2 should be near the circle anchor 2
    And the "bubbleplot_simple_initial_load" snapshot matches the baseline
    And the final state callback should match "back_to_original" within 0.02
