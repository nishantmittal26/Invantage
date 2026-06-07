using System.Collections.Generic;

namespace Invantage.Application.Common.Models
{
    public class GenericResponse<T>
    {
        public bool Succeeded { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<string> Errors { get; set; } = new List<string>();

        public GenericResponse()
        {
        }

        public GenericResponse(T data, string message = "")
        {
            Succeeded = true;
            Message = message;
            Data = data;
        }

        public GenericResponse(string message, bool succeeded = false)
        {
            Succeeded = succeeded;
            Message = message;
        }

        public static GenericResponse<T> Success(T data, string message = "")
        {
            return new GenericResponse<T>(data, message);
        }

        public static GenericResponse<T> Failure(string message, List<string>? errors = null)
        {
            var response = new GenericResponse<T>(message, false);
            if (errors != null)
            {
                response.Errors = errors;
            }
            return response;
        }
    }
}
