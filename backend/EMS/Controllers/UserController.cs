using EMS.Data;
using EMS.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.SqlServer.Server;
using System;


namespace EMS.Controllers
{
    [ApiController]
    [Route("User")]
    public class UserController : Controller
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly AppDbContext _context;

        public UserController(UserManager<IdentityUser> userManager, SignInManager<IdentityUser> signInManager, AppDbContext context)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _context = context;
        }
        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            if (!ModelState.IsValid)
            {
                Console.WriteLine("Model Error");
                return View(model);
            }


            if (model.Password != model.ConfirmedPassword)
            {
                ModelState.AddModelError("", "Passwords do not match");
                return View(model);
            }

            var user = new IdentityUser
            {
                UserName = model.Email,
                Email = model.Email
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                Console.WriteLine("Success");
                return Ok(new {success=true,redirectTo="/login"});
            }

            return Ok(new {success=false});


        }
        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {

            if (!ModelState.IsValid)
                return View(model);

            var result = await _signInManager.PasswordSignInAsync(
                model.Username,
                model.Password,
                isPersistent: false,
                lockoutOnFailure: true
            );

            if (result.Succeeded)
            {
                Console.WriteLine("Logged in successfully");
                return Ok(new { success = true });
            }
               

            //ModelState.AddModelError("", "Invalid login attempt");
            return Ok(new { success = false });
        }
        //[Authorize]
        [HttpGet("whoami")]
        public  IActionResult whoami()
        {
            Console.WriteLine("User is ->" + User.Identity!.Name);
            return Ok(new
            {
                username = User.Identity!.Name,
                roles = User.Claims
                .Where(c => c.Type == "role")
                .Select(c => c.Value)
            }); 
            
        }

    }
}
