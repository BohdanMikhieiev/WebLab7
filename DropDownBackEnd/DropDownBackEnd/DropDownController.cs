using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace DropDownBackEnd;

public class DropDownController
{
    [ApiController]
    [Route("api/[controller]")]
    public class DropdownController : ControllerBase
    {
        private const string FilePath = "dropdownData.json";
        
        [HttpGet]
        public IActionResult GetDropdownData()
        {
            if (!System.IO.File.Exists(FilePath))
                return NotFound("Data not found");

            var jsonData = System.IO.File.ReadAllText(FilePath);
            var dropdownData = JsonSerializer.Deserialize<List<DropdownItem>>(jsonData);
            return Ok(dropdownData);
        }
        
        [HttpPost]
        public IActionResult SaveDropdownData([FromBody] List<DropdownItem> dropdownData)
        {
            var jsonData = JsonSerializer.Serialize(dropdownData);
            System.IO.File.WriteAllText(FilePath, jsonData);
            return Ok("Data saved successfully");
        }
    }

    public class DropdownItem
    {
        public string Title { get; set; }
        public List<DropdownOption> Options { get; set; }
    }

    public class DropdownOption
    {
        public string Name { get; set; }
        public string Link { get; set; }
    }
}