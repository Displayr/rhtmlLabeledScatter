class DragUtils
  instance = null

  @get: ->
    if not instance?
      instance = new DU()
    instance

  class DU
    constructor: ->

    getLabelDragAndDrop: (plot) ->
      dragStart = () ->
        plot.svg.selectAll('.link').remove()

      dragMove = () ->
        d3.select(@)
        .attr('x', d3.event.x)
        .attr('y', d3.event.y)

        # Save the new location of text so links can be redrawn
        id = d3.select(@).attr('id')
        label = _.find plot.data.lab, (l) -> l.id == Number(id)
        if $(@).prop("tagName") == 'image'
          label.x = d3.event.x + label.width/2
          label.y = d3.event.y + label.height
        else
          label.x = d3.event.x
          label.y = d3.event.y


      dragEnd = ->
        # If label is dragged out of viewBox, remove the lab and add to legend
        id = Number(d3.select(@).attr('id'))
        lab = _.find plot.data.lab, (l) -> l.id == id
        anc = _.find plot.data.pts, (a) -> a.id == id
        if plot.data.isOutsideViewBox(lab)
          # Element dragged off plot
          plot.data.addElemToLegend(id)
          plot.state.pushLegendPt(id)
          plot.resetPlotAfterDragEvent()
        else if (lab.x - lab.width/2 < anc.x < lab.x + lab.width/2) and (lab.y > anc.y > lab.y - lab.height)
          ancToHide = plot.svg.select("#anc-#{id}").attr('fill-opacity', 0)
        else
          plot.state.pushUserPositionedLabel(id, lab.x, lab.y, plot.viewBoxDim)
          ancToHide = plot.svg.select("#anc-#{id}").attr('fill-opacity', (d) -> d.fillOpacity)
          plot.drawLinks()

      d3.behavior.drag()
               .origin(() ->
                 {
                   x: d3.select(this).attr("x")
                   y: d3.select(this).attr("y")
                 }
                )
               .on('dragstart', dragStart)
               .on('drag', dragMove)
               .on('dragend', dragEnd)


    getLegendLabelDragAndDrop: (plot, data) =>
      dragStart = ->

      dragMove = ->
        d3.select(@)
        .attr('x', d3.select(@).x = d3.event.x)
        .attr('y', d3.select(@).y = d3.event.y)

        # Save the new location of text so links can be redrawn
        id = d3.select(@).attr('id').split('legend-')[1]
        legendPt = _.find data.legendPts, (l) -> l.id == Number(id)
        legendPt.lab.x = d3.event.x
        legendPt.lab.y = d3.event.y

      dragEnd = ->
        id = Number(d3.select(@).attr('id').split('legend-')[1])
        legendPt = _.find data.legendPts, (l) -> l.id == Number(id)
        if plot.data.isLegendPtOutsideViewBox(legendPt.lab)
          d3.select(@)
            .attr('x', d3.select(@).x = legendPt.x)
            .attr('y', d3.select(@).y = legendPt.y)
        else
          # Element dragged onto plot
          plot.data.removeElemFromLegend(id)
          plot.state.pullLegendPt(id)
          plot.resetPlotAfterDragEvent()


      d3.behavior.drag()
             .origin(() ->
               {
                 x: d3.select(this).attr("x")
                 y: d3.select(this).attr("y")
               }
              )
             .on('dragstart', dragStart)
             .on('drag', dragMove)
             .on('dragend', dragEnd)
