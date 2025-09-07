using UnityEngine;

public class EnterActivator : MonoBehaviour
{
    public GameObject objectToActivate;
    public string websiteURL;

    private bool playerIsInside = false;

    private void Start()
    {
        objectToActivate.SetActive(false);
    }

    private void OnTriggerEnter(Collider other)
    {
        objectToActivate.SetActive(true);
        playerIsInside = true;
    }

    private void OnTriggerExit(Collider other)
    {
        objectToActivate.SetActive(false);
        playerIsInside = false;
    }

    private void Update()
    {
        if (playerIsInside && Input.GetKeyDown(KeyCode.F))
        {
            if (!string.IsNullOrEmpty(websiteURL))
                Application.OpenURL(websiteURL);
        }
    }
}