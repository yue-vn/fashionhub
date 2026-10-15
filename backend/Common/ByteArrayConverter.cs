using System.Text.Json;
using System.Text.Json.Serialization;

namespace UltraStrore.Common
{
    public class ByteArrayConverter : JsonConverter<byte[]?>
    {
        public override byte[]? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.Null)
                return null;
            string? str = reader.GetString();
            if (string.IsNullOrEmpty(str))
                return null;
            if (str.StartsWith("/") || str.StartsWith("http"))
                return System.Text.Encoding.UTF8.GetBytes(str);
            try
            {
                return Convert.FromBase64String(str);
            }
            catch
            {
                return System.Text.Encoding.UTF8.GetBytes(str);
            }
        }

        public override void Write(Utf8JsonWriter writer, byte[]? value, JsonSerializerOptions options)
        {
            if (value == null)
            {
                writer.WriteNullValue();
            }
            else if (value.Length > 0 && (value[0] == (byte)'/' || (value.Length > 4 && value[0] == (byte)'h' && value[1] == (byte)'t')))
            {
                writer.WriteStringValue(System.Text.Encoding.UTF8.GetString(value));
            }
            else
            {
                writer.WriteStringValue(Convert.ToBase64String(value));
            }
        }
    }
}