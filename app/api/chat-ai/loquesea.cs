
using System; 
using System.Net.Http; 
using System.Text; 
using System.Text.Json; 
using System.Threading.Tasks; 


namespace ExperticketApiExample { 
    
    
    public class SaleCancellationRequest { 
        
         Importante: Debes reemplazarlo con el valor correcto private const string 
         
         
         ApiKey = "YourApiKey"; 
         
         public async Task CancelSaleAsync(string saleId) { 
            
            var client = new HttpClient(); client.BaseAddress = new Uri("https://testxperttrk.com/api/"); 
            var cancellationRequest = new { ApiKey, SaleId = saleId, CancellationReason = 1, Comments = "Producto sin stock disponible" }; 
            var json = JsonSerializer.Serialize(cancellationRequest); 
            var data = new StringContent(json, Encoding.UTF8, "application/json"); 
            var response = await client.PostAsync("salerescission", data); 
            string responseContent = await response.Content.ReadAsStringAsync(); 
            if (response.IsSuccessStatusCode) { Console.WriteLine("Venta cancelada exitosamente."); 
            } else { 
                Console.WriteLine($"Error al cancelar la venta: {responseContent}"); 
                
                } } } }