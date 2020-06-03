"Leader Line" rendering logic
---
  
  * dont draw a leaderline if the label is inside the anchor
  * dont draw a leaderline if there is no label
  * logic for choosing how to add a leaderline between an anchor and a image label
    * draw line from label centroid to anchor.
  * logic for choosing how to add a leaderline between an anchor and a text label
    * If label is horizontally centered and > 10 pixels above or below anchor then draw line
    * If label is diagonally oriented (i.e., no vertical or horizontal overlap), then draw line
    * If label is vertically aligned and > 10 pixels left or right of anchor then draw line
    * If none of the above then:
      * if there is NO other anchor nearby (within 10 pixels) do not draw a line
      * if there are AT least ONE nearby anchor draw a line using this logic
        * if the anchor and label are both vertically and horizontally overlapping, draw line connecting to labels bottom center connector
        * draw a line using the connector that "makes sense" <-- code is pretty obvious here, similar to first set of rules
      
Key takeaway here is that there are two conditions where lines will not be drawn
  * label is horizontally oriented, it is very vertically close to anchor, and there are no nearby neighbors
  * label is vertically oriented, it is very horizontally close to anchor, and there are no nearby neighbors
