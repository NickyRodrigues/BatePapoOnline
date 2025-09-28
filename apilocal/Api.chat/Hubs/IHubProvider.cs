using Api.chat.Model;

namespace Api.chat.Hubs
{
    public interface IHubProvider
    {
        Task ReceivedMessage(Message message);
    }
}
