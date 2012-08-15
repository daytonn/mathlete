describe("Mathlete", function() {

  it("should have an index template", function() {
    expect(Mathlete.Templates.index).toBeDefined();
  });

  it("should have a times table", function() {
    expect(Mathlete.timesTable).toBeDefined();
    expect(Mathlete.scoreBoard).toBeDefined();
  });

  it("should pick a random card", function() {
    var length = Mathlete.questions.length;
    var firstQuestion = Mathlete.pickRandomCard().question;
    var newLength = Mathlete.questions.length;
    var secondQuestion = Mathlete.pickRandomCard().question;
    expect(firstQuestion).toNotMatch(secondQuestion);
    expect(length).toBeGreaterThan(newLength);
  });

});