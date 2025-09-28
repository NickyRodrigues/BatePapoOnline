using Api.chat.Model;
using Microsoft.AspNetCore.SignalR;

namespace Api.chat.Hubs
{
    public class HubProvider : Hub<IHubProvider>
    {
        public async Task SendMessage(Message  message)
        {
            await Clients.All.ReceivedMessage(message);
        }
    }
}
