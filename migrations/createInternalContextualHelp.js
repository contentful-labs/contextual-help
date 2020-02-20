module.exports = function(migration) {
  const internalContextualHelp = migration
    .createContentType("internalContextualHelp")
    .name("Internal - Contextual Help")
    .description("sfgiuhsdfghkdfsjkdkbfjhbdf\nbsdfsdfbnjkbdfkjhbdkhj")
    .displayField("contentTypeId");

  internalContextualHelp
    .createField("contentTypeId")
    .name("Content Type ID")
    .type("Symbol")
    .localized(false)
    .required(true)
    .validations([
      {
        unique: true
      }
    ])
    .disabled(false)
    .omitted(false);

  internalContextualHelp
    .createField("helpText")
    .name("Help Text")
    .type("RichText")
    .localized(false)
    .required(false)
    .validations([
      {
        nodes: {}
      },
      {
        enabledNodeTypes: [
          "heading-1",
          "heading-2",
          "heading-3",
          "heading-4",
          "heading-5",
          "heading-6",
          "ordered-list",
          "unordered-list",
          "hr",
          "blockquote",
          "embedded-asset-block",
          "hyperlink"
        ],

        message:
          "Only heading 1, heading 2, heading 3, heading 4, heading 5, heading 6, ordered list, unordered list, horizontal rule, quote, asset, and link to Url nodes are allowed"
      }
    ])
    .disabled(false)
    .omitted(false);

  internalContextualHelp.changeFieldControl(
    "contentTypeId",
    "extension",
    "contextual-help",
    {}
  );
  internalContextualHelp.changeFieldControl(
    "helpText",
    "builtin",
    "richTextEditor",
    {}
  );
};
