Feature: State Interactions
  Interaction should cause a state callback, and when I rerender with that new state value, I should see the same state as caused by the interaction

  @applitools
  Scenario: User can drag a scatterplot label on the canvas
    Given I am viewing "three_point_brand_scatterplot"
    Then the "three_point_brand_scatterplot_initial_load" snapshot matches the baseline
    # TODO the drag step does not wait, so this test only works because the snapshot steps slow things down ...
    When I drag label 0 by 50 x 50
    Then label 0 should stay in the new location
    And the "three_point_brand_scatterplot_after_label_drag" snapshot matches the baseline
    And the final state callback should match "porche_label_moved_50x50"

  @applitools
  Scenario: User can load a scatterplot label with saved state (user drag label on canvas) and see their modified scatterplot
    Given I am viewing "three_point_brand_scatterplot" with state "porche_label_moved_50x50"
    Then the "three_point_brand_scatterplot_after_label_drag" snapshot matches the baseline

  @applitools
  Scenario: User can drag a scatterplot label off of the canvas
    Given I am viewing "three_point_brand_scatterplot"
    # TODO the drag step does not wait, so this test only works because the snapshot steps slow things down ...
    When I drag label 0 to the legend
    Then label 0 should be in the legend
    And the "three_point_brand_scatterplot_after_label_drag_to_legend" snapshot matches the baseline
    And the final state callback should match "porche_label_moved_to_legend"

  @applitools
  Scenario: User can load a scatterplot label with saved state (user drag label to legend) and see their modified scatterplot
    Given I am viewing "three_point_brand_scatterplot" with state "porche_label_moved_to_legend"
    Then the "three_point_brand_scatterplot_after_label_drag_to_legend" snapshot matches the baseline
