
class ScatterPlotPage {
  constructor (page) {
    this.page = page
  }

  async movePlotLabel ({ id, x, y }) {
    const label = await this.plotLabel({ id })
    const labelBox = await label.boundingBox()

    const initialMousePosition = {
      x: labelBox.x + labelBox.width / 2,
      y: labelBox.y + labelBox.height / 2,
    }

    const finalMousePosition = {
      x: initialMousePosition.x + x,
      y: initialMousePosition.y + y,
    }

    return this.drag({ from: initialMousePosition, to: finalMousePosition })
  }

  async movePlotLabelToLegend ({ id }) {
    const label = await this.plotLabel({ id })
    const labelBox = await label.boundingBox()

    const legend = await this.legendGroup()
    const legendBox = await legend.boundingBox()

    const initialMousePosition = {
      x: labelBox.x + labelBox.width / 2,
      y: labelBox.y + labelBox.height / 2,
    }

    const finalMousePosition = {
      x: legendBox.x + legendBox.width / 2,
      y: legendBox.y + legendBox.height / 2,
    }

    return this.drag({ from: initialMousePosition, to: finalMousePosition })
  }

  async moveLegendLabelToPlot ({ id }) {
    const legendLabel = await this.legendLabel({ id })
    const legendLabelBox = await legendLabel.boundingBox()

    const initialMousePosition = {
      x: legendLabelBox.x + legendLabelBox.width / 2,
      y: legendLabelBox.y + legendLabelBox.height / 2,
    }

    const finalMousePosition = {
      x: initialMousePosition.x - 300,
      y: initialMousePosition.y,
    }

    return this.drag({ from: initialMousePosition, to: finalMousePosition })
  }

  async moveMouseOntoPlot () {
    // XXX this is an assumption that currently holds based on tests ...
    const unmovedLabel = await this.plotLabel({ id: 1 })
    const unmovedLabelBox = await unmovedLabel.boundingBox()

    const initialMousePosition = {
      x: unmovedLabelBox.x + unmovedLabelBox.width / 2,
      y: unmovedLabelBox.y + unmovedLabelBox.height / 2,
    }

    return this.page.mouse.move(initialMousePosition.x, initialMousePosition.y)
  }

  async moveMouseOntoAnchor ({ id }) {
    return this.page.hover(`#anc-${id}`)
  }

  async clickMouseOnAnchor ({ id }) {
    return this.page.click(`#anc-${id}`)
  }

  async clickResetButton () {
    return this.page.click('.plot-reset-button')
  }

  async plotLabel ({ id }) {
    return this.page.$(`[id="${id}"]`)
  }

  async legendGroup () {
    return this.page.$('.legend-groups-text')
  }

  async legendLabel ({ id }) {
    return this.page.$(`#legend-${id}`)
  }

  async drag ({ to, from }) {
    await this.page.mouse.move(from.x, from.y)
    await this.page.mouse.down()

    await this.page.mouse.move(to.x, to.y)
    return this.page.mouse.up()
  }
}

module.exports = ScatterPlotPage
