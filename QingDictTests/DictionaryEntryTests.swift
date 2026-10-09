import XCTest
@testable import QingDict

final class DictionaryEntryTests: XCTestCase {
    func testEntryDecodesFromImportFormat() throws {
        let json = """
        [{
          "id":"test-hello",
          "headword":"hello",
          "alternate":null,
          "pronunciation":"/həˈləʊ/",
          "partOfSpeech":"interjection",
          "direction":"enToZh",
          "definitions":["你好"],
          "examples":[],
          "sourceName":"Test",
          "sourceURL":null,
          "license":"Test only"
        }]
        """

        let entries = try JSONDecoder().decode([DictionaryEntry].self, from: Data(json.utf8))
        XCTAssertEqual(entries.first?.headword, "hello")
        XCTAssertEqual(entries.first?.direction, .enToZh)
    }

    func testSearchTextContainsDefinitionsAndPronunciation() {
        let entry = DictionaryEntry(
            id: "1",
            headword: "你好",
            alternate: nil,
            pronunciation: "nǐ hǎo",
            partOfSpeech: nil,
            direction: .zhToEn,
            definitions: ["hello"],
            examples: [],
            sourceName: "Test",
            sourceURL: nil,
            license: "Test"
        )
        XCTAssertTrue(entry.searchableText.contains("hello"))
        XCTAssertTrue(entry.searchableText.contains("ni hao"))
    }
}
